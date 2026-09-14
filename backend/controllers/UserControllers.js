const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { Member, Payment } = require("../models");
const Trainer = require("../models/Trainer");
const bcrypt = require("bcryptjs");
const ActivityLog = require("../models/ActivityLog");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

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
    offer_duration
} = req.body;

const category = await Category.findByPk(category_id);
if (!category) {
    return res.status(404).json({ message: "category not found" });
}

const isOldMember = memberType === "ancien";
const memberJoinDate = isOldMember ? joinDate : new Date().toISOString().split('T')[0];

const member = await Member.create({
    name,
    phone,
    category_id,
    joined_at: memberJoinDate,
});

const INTERVAL_MONTHS = {
    "monthly": 1,
    "three_month": 3,
    "six_month": 6,
    "yearly": 12,
};

function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d;
}

const paymentType = offer_duration || "monthly";
const nextPayment =
    paymentType === "yearly"
        ? addMonths(memberJoinDate, 12)
        : addMonths(memberJoinDate, INTERVAL_MONTHS[paymentType] || 1);

let subscription;
let payment = null;

if (isOldMember) {
    subscription = await Subscription.create({
        amount: category.price,
        member_id: member.id,
        status: isPaidCurrentMonth ? "payé" : "non payé",
        payment_type: paymentType,
        next_payment_at: nextPayment,
    });

    if (isPaidCurrentMonth) {
        payment = await Payment.create({
            amount: category.price,
            subscription_id: subscription.id,
        });
    }
} else {
    subscription = await Subscription.create({
        amount: category.price,
        member_id: member.id,
        payment_type: paymentType,
        next_payment_at: nextPayment,
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

exports.DeleteMember = async (req,res) => {
     try{
        const {id} = req.params
        const userId = req.userId;
        const member = await Member.findByPk(id)
        if(!member){
            res.status(404).json({message:"member not found"})
        }
        const user = await User.findByPk(userId)
           await ActivityLog.create({
                action:"delete",
                description:`${user.name} a supprimé le member  ${member.name}`,
                entity_type:"member",
                entity_id:id,
                entity_name:member.name,
                user_name:user.name,
                user_role:user.role,
                user_id:user.id,
                old_values: {"name":member.name,"phone":member.phone },
            })
            member.update({status:"suspendu"})
            res.json({message:"member deleted"})
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

// ---- shared helpers (module scope, used by both AddMember and UpdateMember) ----
const INTERVAL_MONTHS = {
    "monthly": 1,
    "three_month": 3,
    "six_month": 6,
    "yearly": 12,
};

function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d;
}

function computeNextPayment(fromDateStr, offerDuration) {
    const paymentType = offerDuration || "monthly";
    return paymentType === "yearly"
        ? addMonths(fromDateStr, 12)
        : addMonths(fromDateStr, INTERVAL_MONTHS[paymentType] || 1);
}

exports.UpdateMember = [
    body("name").notEmpty().withMessage("name required"),
    body("phone").notEmpty().withMessage("phone required"),
    body("category_id").notEmpty().withMessage("category required"),

    async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(422).json({
                errors: error.array().map(err => err.msg),
            });
        }

        try {
            const user_id = req.userId;
            const { id } = req.params;

            const {
                name,
                phone,
                category_id,
                isPaidCurrentMonth,
                offer_duration,
            } = req.body;

            // Get current user
            const user = await User.findByPk(user_id);

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }

            // Get member
            const member = await Member.findByPk(id);

            if (!member) {
                return res.status(404).json({
                    message: "member not found",
                });
            }

            // Get category
            const category = await Category.findByPk(category_id);

            if (!category) {
                return res.status(404).json({
                    message: "category not found",
                });
            }

            // Keep old values for activity log
            const oldValues = {
                name: member.name,
                phone: member.phone,
                category_id: member.category_id,
            };

            // Update member
            await member.update({
                name,
                phone,
                category_id,
            });

            const paymentType = offer_duration || "monthly";

            // Get current subscription
            const subscription = await Subscription.findOne({
                where: {
                    member_id: member.id,
                },
                order: [["createdAt", "DESC"]],
            });

            if (subscription) {
                // Base the next payment date on the subscription's existing
                // next_payment_at if present, else on today. This avoids
                // silently resetting the cycle anchor on every edit unless
                // the duration actually changed.
                const durationChanged = subscription.payment_type !== paymentType;
                const baseDateStr = durationChanged || !subscription.next_payment_at
                    ? new Date().toISOString().split('T')[0]
                    : new Date(subscription.next_payment_at).toISOString().split('T')[0];

                const nextPayment = durationChanged
                    ? computeNextPayment(new Date().toISOString().split('T')[0], paymentType)
                    : subscription.next_payment_at;

                // Update subscription amount / payment type if changed
                await subscription.update({
                    amount: category.price,
                    status: isPaidCurrentMonth ? "payé" : "non payé",
                    payment_type: paymentType,
                    next_payment_at: nextPayment,
                });

                // Payment handling
                const payment = await Payment.findOne({
                    where: {
                        subscription_id: subscription.id,
                    },
                });

                if (isPaidCurrentMonth) {
                    // Create payment if it doesn't exist
                    if (!payment) {
                        await Payment.create({
                            amount: category.price,
                            subscription_id: subscription.id,
                        });
                    } else {
                        // Update existing payment
                        await payment.update({
                            amount: category.price,
                        });
                    }
                } else {
                    // If marked as unpaid, remove existing payment
                    if (payment) {
                        await payment.destroy();
                    }
                }
            } else {
                // If member doesn't have a subscription, create one
                const today = new Date().toISOString().split('T')[0];
                const nextPayment = computeNextPayment(today, paymentType);

                const newSubscription = await Subscription.create({
                    amount: category.price,
                    member_id: member.id,
                    status: isPaidCurrentMonth ? "payé" : "non payé",
                    payment_type: paymentType,
                    next_payment_at: nextPayment,
                });

                if (isPaidCurrentMonth) {
                    await Payment.create({
                        amount: category.price,
                        subscription_id: newSubscription.id,
                    });
                }
            }
            

            // Activity log
            await ActivityLog.create({
                action: "update",
                description: `${user.name} a modifié le membre ${name}`,
                entity_type: "member",
                entity_id: member.id,
                entity_name: name,
                user_name: user.name,
                user_role: user.role,
                user_id: user.id,
                old_values: oldValues,
                new_values: {
                    name,
                    phone,
                    category_id,
                    isPaidCurrentMonth,
                    payment_type: paymentType,
                },
            });

           

            return res.status(200).json({
                message: "member updated",
            });

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                message: "server error",
            });
        }
    },
];


exports.DownloadMember = async (req, res) => {
    try {
        const members = await Member.findAll({
            include: [
                { model: Category, as: "category", attributes: ["name"] },
                { model: Subscription, as: "subscription", attributes: ["payment_type"] },
            ],
        });
        const paymentTypeLabels = {
        monthly: "Mensuel",
        three_month: "Trimestriel",
        six_month: "Semestriel",
        yearly: "Annuel",
        };

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Members");

        sheet.columns = [
            { header: "Nom", key: "firstName", width: 20 },
            { header: "Prénom", key: "lastName", width: 20 },
            { header: "Téléphone", key: "phone", width: 15 },
            { header: "Catégorie", key: "category", width: 20 },
            { header: "Date d'inscription", key: "joined_at", width: 15 },
            { header: "Type de paiement", key: "payment_type", width: 15 },
        ];

        members.forEach((member) => {
            const [firstName, ...rest] = (member.name || "").trim().split(" ");
            sheet.addRow({
                firstName,
                lastName: rest.join(" "),
                phone: member.phone,
                category: member.category ? member.category.name : "",
                joined_at: member.joined_at,
                payment_type: member.subscription
                ? paymentTypeLabels[member.subscription.payment_type] || ""
                : "",
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=members.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to export members" });
    }
};