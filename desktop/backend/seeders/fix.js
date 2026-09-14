require("dotenv").config();

const sequelize = require("../config/db");
const { Subscription } = require("../models");

function addMonths(date, months) {
    const result = new Date(date);

    result.setMonth(result.getMonth() + months);

    return result;
}

async function fixNew() {
  try {
    await sequelize.sync();

    await sequelize.query(`
      UPDATE "members"
      SET "joined_at" = DATE("createdAt")
      WHERE "joined_at" IS NULL
    `);


     const users = await Subscription.findAll();

        for (const user of users) {
            let months;

            switch (user.payment_type) {
                case "monthly":
                    months = 1;
                    break;

                case "three_month":
                    months = 3;
                    break;

                case "six_month":
                    months = 6;
                    break;

                case "yearly":
                    months = 12;
                    break;

                default:
                    months = 1;
            }

            const nextPayment = addMonths(user.date, months);

            await user.update({
                next_payment_at: nextPayment,
            });
        }





    console.log("fix for all members");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixNew();