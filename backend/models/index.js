const Category = require("./Category");
const Subscription = require("./Subscription");
const User = require("./User");

User.hasOne(Subscription,{
    foreignKey:"member_id",
    as:"subscription"
})

Subscription.belongsTo(User,{
    foreignKey:"member_id",
    as:"userSubscription"
})

Category.hasOne(Subscription,{
    foreignKey:"category_id",
    as:"subscriptionCategory"
})

Subscription.belongsTo(Category,{
    foreignKey:"category_id",
    as:"categorySubscription"
})

module.exports = {User,Category,Subscription}