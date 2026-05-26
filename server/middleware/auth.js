// import User from "../models/User.js";
// import jwt, { decode } from "jsonwebtoken";

// // Middleware to protect routes
// export const protectRoute = async (req, res, next)=>{
//     try {
//         const token = req.headers.token;
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.userId).select("-password");

//         if (!user) {
//             return res.json({success: false, message: "User not found"});
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(error.message);
//         return res.json({success: false, message: error.message});
//     }
// }





import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {

    try {

        const token = req.headers.token;

        console.log("TOKEN:", token);

        // Check token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("DECODED:", decoded);

        // Find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        console.log("AUTH ERROR:", error.message);

        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}