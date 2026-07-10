const Category = require("./Category");
const Member = require("./Member");
const Subscription = require("./Subscription");

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

module.exports = {Category,Subscription,Member}