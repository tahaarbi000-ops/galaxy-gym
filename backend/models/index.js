const Category = require("./Category");
const Member = require("./Member");
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

module.exports = {Category,Subscription,Member,Trainer}