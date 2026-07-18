const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { Member, Payment } = require("../models");
const Trainer = require("../models/Trainer");
const bcrypt = require("bcryptjs");
const ActivityLog = require("../models/ActivityLog");

exports.AddMember = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("category_id").notEmpty().withMessage("category required"),
    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({ errors: error.array().map(err => err.msg) });
        }
        try {
            const user_id = req.userId;
            const user = await User.findByPk(user_id);
            const {
                name,
                phone,
                category_id,
                memberType,          
                joinDate,            
                isPaidCurrentMonth,   
            } = req.body;

            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(404).json({ message: "category not found" });
            }

            const isOldMember = memberType === "ancien";

            // If it's an old member with a join date, backdate createdAt
            const member = await Member.create({
                name,
                phone,
                category_id,
                ...(isOldMember && joinDate ? { createdAt: new Date(joinDate) } : {}),
            });

            let subscription;
            let payment = null;

            if (isOldMember) {
               
                subscription = await Subscription.create({
                    amount: category.price,
                    member_id: member.id,
                    status: isPaidCurrentMonth ? "payé" : "non payé",
                });

                if (isPaidCurrentMonth) {
                    payment = await Payment.create({
                        amount: category.price,
                        subscription_id: subscription.id,
                    });
                }
            } else {
                // New member: keep the original behaviour — subscription +
                // payment created immediately
                subscription = await Subscription.create({
                    amount: category.price,
                    member_id: member.id,
                });
                payment = await Payment.create({
                    amount: category.price,
                    subscription_id: subscription.id,
                });
            }

            await ActivityLog.create({
                action: "create",
                description: `${user.name} a ajouté le membre ${name}`,
                entity_type: "member",
                entity_id: member.id,
                entity_name: name,
                user_name: user.name,
                user_role: user.role,
                user_id: user.id,
                new_values: { name, phone, category_id, memberType: memberType || "nouveau" },
            });

            return res.status(201).json({ message: "member created" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server error" });
        }
    },
];
exports.AddTrainer = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("experience").notEmpty().withMessage("experience required"),
    body("category_id").notEmpty().withMessage("category_id required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
        const user_id = req.userId;
    const { name,phone,category_id,experience } = req.body;
    const category = await Category.findByPk(category_id)
    if(!category){
        return res.status(404).json({ message:"category not found" });
    }
    const trainer = await Trainer.create({name,phone,experience,category_id});
    const user = await User.findByPk(user_id)
     await ActivityLog.create({
        action:"create",
        description:`${user.name} a ajouté le trainer ${name}`,
        entity_type:"trainer",
        entity_id:trainer.id,
        entity_name:name,
        user_name:user.name,
        user_role:user.role,
        user_id:user.id,
        new_values: { "name": name, "phone": phone,"experience":experience, "category_id": category_id },
    })
    return res.status(201).json({message:"trainer created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]
exports.AddSecretary = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("email").notEmpty().withMessage("email required"),
    body("shift").notEmpty().withMessage("shift required"),
    body("status").notEmpty().withMessage("status required"),
    body("password").notEmpty().withMessage("password required"),
    async (req,res) => {
        const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
        const user_id = req.userId;
    const { name,phone,email,password,shift,status } = req.body;
    const user = await User.findOne({where:{email}})
    if(user){
        return res.status(400).json({message:"email exist"});
    }
    const currentUser =  await User.findByPk(user_id)
    const hashPassword = await bcrypt.hash(password,10)
    const userCreate = await User.create({name,phone,email,status,shift,password:hashPassword,role:"secrétariat"});
    await ActivityLog.create({
        action:"create",
        description:`${currentUser.name} a ajouté le secrétariat ${name}`,
        entity_type:"user",
        entity_id:userCreate.id,
        entity_name:name,
        user_name:currentUser.name,
        user_role:currentUser.role,
        user_id:currentUser.id,
        new_values: { "name": name, "phone": phone, "email": email,"shift":shift,"status":status },
    })
    
    return res.status(201).json({message:"secretary created"});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}
]
exports.GetUsers = async (req,res) => {
    try{
        const {type} = req.params
        let data = [];
        if(type === "member"){
            data = await Member.findAll({
                include:[
                    {
                        model:Category,
                        as:"category",
                        attributes:["name"]
                    }
                ]
            })
        }    
        else if(type === "trainer"){
            data = await Trainer.findAll({
        include:[{
            model:Category,
            as:"categoryTrainer"
        }]
        })
        }
        else{
            data = await User.findAll({where:{role:"secrétariat"},attributes:{exclude:"password"}})
        } 
    return res.json({message:`all ${type}`,users:data});
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }
}
exports.GetUserById = async (req,res) => {
    
}
exports.DeleteSecretary = async (req,res) => {
    try{
        const {id} = req.params
        const userId = req.userId;
        const secretary = await User.findByPk(id)
        if(!secretary){
            res.status(404).json({message:"secretary not found"})
        }
        const user = await User.findByPk(userId)
           await ActivityLog.create({
                action:"delete",
                description:`${user.name} a supprimé le secrétariat ${secretary.name}`,
                entity_type:"user",
                entity_id:id,
                entity_name:secretary.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: { "status":user.status },
                new_values: {"status":"supprimé" },
            })
            secretary.update({status:"supprimé" } )
            res.json({message:"secretary deleted"})

    }catch{
        res.status(500).json({message:"server error"})
    }
}
exports.DeleteTrainer = async (req,res) => {
     try{
        const {id} = req.params
        const userId = req.userId;
        const trainer = await Trainer.findByPk(id)
        if(!trainer){
            res.status(404).json({message:"trainer not found"})
        }
        const user = await User.findByPk(userId)
           await ActivityLog.create({
                action:"delete",
                description:`${user.name} a supprimé le entraîneur  ${trainer.name}`,
                entity_type:"trainer",
                entity_id:id,
                entity_name:trainer.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: {"name":trainer.name,"phone":trainer.phone,"experience":trainer.experience,"category_id":trainer.category_id },
            })
            trainer.destroy()
            res.json({message:"trainer deleted"})
    }catch{
        res.status(500).json({message:"server error"})
    }
}
exports.UpdateTrainer = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("experience").notEmpty().withMessage("experience required"),
    body("category_id").notEmpty().withMessage("category_id required"),
    async (req,res) => {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try{
        const {id} = req.params
        const user_id = req.userId;;
        const { name,phone,category_id,experience } = req.body;
        const trainer = await Trainer.findByPk(id)
        if(!trainer){
            res.status(404).json({message:"trainer not found"})
        }
        trainer.update({name,phone,experience,category_id})
        const user = await User.findByPk(user_id)
         await ActivityLog.create({
        action:"update",
        description:`${user.name} a modifié le trainer ${trainer.name}`,
        entity_type:"trainer",
        entity_id:trainer.id,
        entity_name:trainer.name,
        user_name:user.name,
        user_role:user.role,
        user_id:user.id,
        old_values: { "name": trainer.name, "phone": trainer.phone,"experience":trainer.experience, "category_id": trainer.category_id },
        new_values: { "name": name, "phone": phone,"experience":experience, "category_id": category_id },
    })

    return res.json({message:`trainer updated`});
    }catch(err){
        res.status(500).json({message:"server error"})
    }
}
]

exports.UpdatesSecretary = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("email").notEmpty().withMessage("email required"),
    body("shift").notEmpty().withMessage("shift required"),
    body("status").notEmpty().withMessage("status required"),

    async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(422).json({
                errors: error.array().map(err => err.msg)
            });
        }

        try {
            const userId = req.userId;
            const { id } = req.params;
            const { name, phone, email, password, shift, status } = req.body;

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    message: "secretary not found"
                });
            }

            const emailExist = await User.findOne({
                where: { email }
            });

            if (emailExist && emailExist.id !== user.id) {
                return res.status(400).json({
                    message: "email already exists"
                });
            }

            const updateData = {
                name,
                phone,
                email,
                shift,
                status
            };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
            const currentUser = await User.findByPk(userId);
               await ActivityLog.create({
                action:"update",
                description:`${currentUser.name} a modifié le secrétariat ${user.name}`,
                entity_type:"user",
                entity_id:id,
                entity_name:user.name,
                user_name:currentUser.name,
                user_role:currentUser.role,
                user_id:currentUser.id,
                old_values: { "name": user.name, "phone": user.phone, "email": user.email,"shift":user.shift,"status":user.status },
                new_values: { "name": name, "phone": phone, "email": email,"shift":shift,"status":status },
            })
            await user.update(updateData);

          

            return res.json({
                message: "secretary updated"
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "server error"
            });
        }
    }
];

exports.UpdateMemberStatus = [
    body("status")
        .notEmpty().withMessage("status required")
        .isIn(["actif", "inactif", "suspendu"]).withMessage("invalid status"),

    async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(422).json({
                errors: error.array().map(err => err.msg)
            });
        }

        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.userId;

            const member = await Member.findByPk(id);
            if (!member) {
                return res.status(404).json({ message: "member not found" });
            }
            const user = await User.findByPk(userId)
            await ActivityLog.create({
                action:"update",
                description:`${user.name} a modifié l'état de membre ${member.name}`,
                entity_type:"member",
                entity_id:member.id,
                entity_name:member.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: {  "status":member.status },
                new_values: { "status":status  },
            })

            await member.update({ status });

             

            return res.status(200).json({ message: "status updated" });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "server error" });
        }
    }
];