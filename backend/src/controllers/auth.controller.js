import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from "bcrypt";
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });

    }
    const isPasswordCorrect = await bcrypt.compare (password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({ 
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        profilePic: user.profilePic, 
     });
} catch (error) {
    console.error("Error in login:", error.message);
    return res.status(500).json({ message: "Server error" });
}
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message: "Logout successful"});
    } catch (error) {
    console.error("Error in logout:", error.message);
    return res.status(500).json({ message: "Server error" });
}
};

export const updateProfile= async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId= req.user._id;

        if (!profilePic) {
            return res.status(400).json({message: "Profile pic is required"});
        }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser= await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
    res.status(200).json(updatedUser)
    } catch (error) {
        console.log("error in updating profile", error);
        res.status(500).json({ message: "Internal Server error" });
    }
}
export const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};