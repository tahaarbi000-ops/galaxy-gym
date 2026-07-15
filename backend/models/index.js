const Category = require("./Category");
const Member = require("./Member");
const Payment = require("./Payment");
const Subscription = require("./Subscription");
const Trainer = require("./Trainer");

Member.hasOne(Subscription,{
    foreignKey:"member_id",
    as:"subscription"
})

Subscription.belongsTo(Member,{
    foreignKey:"member_id",
    as:"member"
})

Category.hasOne(Member,{
    foreignKey:"category_id",
    as:"memberCategory"
})

Member.belongsTo(Category,{
    foreignKey:"category_id",
    as:"category"
})

Category.hasOne(Trainer,{
    foreignKey:"category_id",
    as:"trainerCategory"
})

Trainer.belongsTo(Category,{
    foreignKey:"category_id",
    as:"categoryTrainer"
})

Subscription.hasMany(Payment,{
    foreignKey: "subscription_id",
    as: "payments" 
});
Payment.belongsTo(Subscription, {
    foreignKey: "subscription_id",
    as: "subscription" 
});

module.exports = {Category,Subscription,Member,Trainer,Payment}