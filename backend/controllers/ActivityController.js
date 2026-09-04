const ActivityLog = require("../models/ActivityLog")

exports.GetActivity = async (req,res) => {
    try{
        const activity = await ActivityLog.findAll();
        return res.json({message:"activity data",activity});
    }catch{
        res.status(500).json({message:"server error"})
    }
}