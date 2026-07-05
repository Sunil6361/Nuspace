const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const app = express();

// Store OTPs temporarily
const otpStore = {};

// Gmail Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sunilrathod6361659892@gmail.com",
        pass: "ouye qdzv uwlc svsx"
    }
});

transporter.verify(function (error, success) {

    if (error) {
        console.log("Email Error:", error);
    } else {
        console.log("Email Server is Ready");
    }

});

app.use(cors());
app.use(bodyParser.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Multer Storage
const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, "uploads/gallery");
    },

    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({
    storage: storage
});

// About Image Storage
const aboutStorage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, "uploads/about");
    },

    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const uploadAbout = multer({
    storage: aboutStorage
});
// ================= Projects Storage =================

const projectStorage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, "uploads/projects");
    },

    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const uploadProject = multer({
    storage: projectStorage
});

// HTML, CSS, JS, Images serve karega
app.use(express.static(__dirname));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "web.html"));
});

// MySQL Connection
require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error("Database Connection Failed:", err);
    } else {
        console.log("✅ Railway MySQL Connected");
    }
});

// ================= Gallery Upload =================

app.post("/gallery", upload.array("image", 20), (req, res) => {

    try {

        console.log("Request received");
        console.log(req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images selected"
            });
        }

        const images = req.files;

        images.forEach(file => {
            db.query(
                "INSERT INTO gallery(image) VALUES(?)",
                [file.filename],
                (err) => {
                    if (err) {
                        console.log("Database Error:", err);
                    }
                }
            );
        });

        res.json({
            success: true,
            message: "Images Uploaded Successfully"
        });

    } catch (err) {

        console.log("Server Error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.get("/gallery", (req, res) => {
    const sql = "SELECT * FROM gallery ORDER BY id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            return res.json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            data: result
        });
    });
});

app.delete("/gallery/:id", (req, res) => {

    const id = req.params.id;

    // Get image name from database
    db.query("SELECT * FROM gallery WHERE id = ?", [id], (err, result) => {

        if (err) {
            return res.json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.json({
                success: false,
                message: "Image not found"
            });
        }

        const imageName = result[0].image;

        // Image path
        const imagePath = path.join(__dirname, "uploads", "gallery", imageName);

        // Delete image file
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Delete database record
        db.query("DELETE FROM gallery WHERE id = ?", [id], (err) => {

            if (err) {
                return res.json({
                    success: false,
                    message: "Delete failed"
                });
            }

            res.json({
                success: true,
                message: "Image deleted successfully"
            });

        });

    });

});

// ================= About API =================

// Get About Data
app.get("/about", (req, res) => {

    db.query("SELECT * FROM about LIMIT 1", (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            data: result[0]
        });

    });

});

// Update About
app.put("/about", uploadAbout.single("image"), (req, res) => {

    const title = req.body.title;
    const description = req.body.description;

    let image = "";

    if (req.file) {
        image = req.file.filename;

        db.query(
            "UPDATE about SET title=?, description=?, image=? WHERE id=1",
            [title, description, image],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });
                }

                res.json({
                    success: true,
                    message: "About Updated Successfully"
                });

            }
        );

    } else {

        db.query(
            "UPDATE about SET title=?, description=? WHERE id=1",
            [title, description],
            (err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });
                }

                res.json({
                    success: true,
                    message: "About Updated Successfully"
                });

            }
        );

    }

});

// ================= GET PROJECTS =================

app.get("/projects", (req, res) => {

    db.query(
        "SELECT * FROM projects ORDER BY id DESC",
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                data: result
            });

        }
    );

});

app.get("/project/:id", (req, res) => {

    const id = req.params.id;

    const sql = "SELECT * FROM projects WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            data: result[0]
        });

    });

});

// ================= ADD PROJECT =================

app.post("/projects", uploadProject.single("image"), (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select project image"
            });

        }

        const image = req.file.filename;

        const title = req.body.title;

        const category = req.body.category;

        const description = req.body.description;

        const sql = `
            INSERT INTO projects
            (title,category,description,image)
            VALUES(?,?,?,?)
        `;

        db.query(

            sql,

            [title, category, description, image],

            (err) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });

                }

                res.json({

                    success: true,

                    message: "Project Added Successfully"

                });

            }

        );

    }

    catch (err) {

        res.status(500).json(err);

    }

});
// Contact API
app.post("/contact", (req, res) => {

    const { name, email, mobile, message } = req.body;

    const sql = "INSERT INTO contacts(name,email,mobile,message) VALUES (?,?,?,?)";

    db.query(sql, [name, email, mobile, message], (err) => {

        if (err) {
            return res.status(500).json({ message: "Error saving data" });
        }

        res.json({ message: "Inquiry submitted successfully!" });

    });
});

app.get("/contacts", (req, res) => {

    const sql = "SELECT * FROM contacts ORDER BY id DESC";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

app.delete("/contacts/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM contacts WHERE id=?";

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "Deleted Successfully"
        });

    });

});

// Login API
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM admin WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            return res.status(500).json({ success: false });
        }

        if (result.length > 0) {
            res.json({ success: true });
        } else {
            res.json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

    });
});

app.put("/change-password", (req, res) => {

    const { email, currentPassword, newPassword } = req.body;

    const sql = `
        SELECT * FROM admin
        WHERE email=? AND password=?
    `;

    db.query(sql, [email, currentPassword], (err, result) => {

        if (err) {
            return res.json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        db.query(
            "UPDATE admin SET password=? WHERE email=?",
            [newPassword, email],
            (err2) => {

                if (err2) {
                    return res.json({
                        success: false,
                        message: "Password update failed"
                    });
                }

                res.json({
                    success: true,
                    message: "Password changed successfully"
                });

            }
        );

    });

});
// ================= FORGOT PASSWORD =================

app.post("/forgot-password", (req, res) => {

    const { email } = req.body;

    db.query(
        "SELECT * FROM admin WHERE email=?",
        [email],
        async (err, result) => {

            if (err) {
                return res.json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "Email not found"
                });
            }

            // Generate 6-digit OTP
            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            otpStore[email] = otp;

            try {

                await transporter.sendMail({

                    from: "sunilrathod6361659892@gmail.com",
                    to: email,
                    subject: "NuSpace Creations - Password Reset OTP",

                    html: `
                        <h2>Password Reset</h2>
                        <p>Your OTP is:</p>
                        <h1>${otp}</h1>
                        <p>Valid for 10 minutes.</p>
                    `

                });

                res.json({
                    success: true,
                    message: "OTP sent successfully"
                });

            } catch (error) {

                console.log(error);

                res.json({
                    success: false,
                    message: "Email sending failed"
                });

            }

        }
    );

});


// Check if admin already exists
app.get("/check-admin", (req, res) => {

    db.query("SELECT COUNT(*) AS total FROM admin", (err, result) => {

        if (err) {
            return res.json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            total: result[0].total
        });

    });

});


// ================= VERIFY OTP =================

app.post("/verify-otp", (req, res) => {

    const { email, otp } = req.body;

    if (!otpStore[email]) {

        return res.json({
            success: false,
            message: "OTP expired or not found"
        });

    }

    if (otpStore[email] !== otp) {

        return res.json({
            success: false,
            message: "Invalid OTP"
        });

    }

    res.json({
        success: true,
        message: "OTP Verified Successfully"
    });

});
// ================= RESET PASSWORD =================

app.post("/reset-password", (req, res) => {

    const { email, otp, newPassword } = req.body;

    // Check OTP
    if (!otpStore[email] || otpStore[email] !== otp) {

        return res.json({
            success: false,
            message: "Invalid or Expired OTP"
        });

    }

    // Update password
    db.query(
        "UPDATE admin SET password=? WHERE email=?",
        [newPassword, email],
        (err) => {

            if (err) {

                return res.json({
                    success: false,
                    message: "Password update failed"
                });

            }

            // Delete OTP after successful reset
            delete otpStore[email];

            res.json({
                success: true,
                message: "Password updated successfully"
            });

        }
    );

});

// ================= DELETE PROJECT =================

app.delete("/projects/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM projects WHERE id=?",
        [id],
        (err, result) => {

            if (err) {

                return res.json({
                    success: false,
                    message: "Delete failed"
                });

            }

            res.json({
                success: true,
                message: "Project deleted successfully"
            });

        }
    );

});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});