const axios = require("axios")
const moment = require("moment");
const User = require("../../models/user");
const Transaction = require("../../models/transactions");

exports.mpesapayment = async (req, res) => {
    console.log(req.query);
    const amount = req.query.amount;
    const phone = req.query.phone;
    const id = req.query.id
    var user;
    try {
        user = await User.findOne({ _id: id });
    } catch (error) {
        console.log(error);
    }
    let url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    let auth = "Bearer " + req.access_token;
    let Timestamp = moment().format('YYYYMMDDHHmmss')
    let password = new Buffer.from("4078895" + "921234bd44fba65ac807170d7153f0781ebd5a906ddf6d07405fe22916cc5c9e" + Timestamp).toString('base64')
    const callback = `https://infinance.digicoin.co.ke/callback/${id}`
    axios({
        url: url,
        method: "POST",
        headers: {
            "Authorization": auth
        },
        data: {
            "BusinessShortCode": "4078895",
            "Password": password,
            "Timestamp": Timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": "4078895",
            "PhoneNumber": phone,
            "CallBackURL": callback,
            "AccountReference": `Infinance Account:${user.username}`,
            "TransactionDesc": "proccess subscription payment"
        }
    })
        .then((response) => {
            res.status(200).json(response.data)
        })
        .catch((error) => {
            console.log(error)
        })
}


exports.callback = async (req, res, next) => {
    console.log("......sts......")
    console.log(req.body)
    const user_id = req.params.id
    const op = req.query.option;
    console.log(op);
    if (req.body.Body.stkCallback.ResultDesc == "The service request is processed successfully.") {
        const item_data = req.body.Body.stkCallback.CallbackMetadata
        const data = item_data.Item
        console.log(data)
        const amount = data[0].Value;
        const transaction_code = data[1].Value
        const filteredResult = data.find((data) => data.Name == 'PhoneNumber');
        const phone = filteredResult.Value;
        if (op) {
            const transactionData = new Transaction({ PhoneNumber: phone, Amount: amount, Transactioncode: transaction_code });
            await transactionData.save();
            const user_data = await User.findOne({ _id: user_id });
            const upline = user_data.upline;
            const dashboard_data = await Dashboard.findOne({ user: upline })
            dashboard_data.balance += 500;
            dashboard_data.save();
            switch (op) {
                case '1':
                    if (amount == '1') {
                        const newLesson = new Lessons({ lessonId: '1', user: user_id })
                        await newLesson.save();
                    }
                    break;
                case '2':
                    if (amount == '1') {
                        const newLesson = new Lessons({ lessonId: '2', user: user_id })
                        await newLesson.save();
                    }
                    break;
                case '3':
                    if (amount == '1') {
                        const newLesson = new Lessons({ lessonId: '3', user: user_id })
                        await newLesson.save();
                    }
                    break;
                case '4':
                    if (amount == '1') {
                        const newLesson = new Lessons({ lessonId: '4', user: user_id })
                        await newLesson.save();
                    }
                    break;
            }
            req.flash('success', 'Success in buying a course');
            res.redirect('/lessons')
            return
        }

        try {
            const user_dashboard = await Dashboard.findOne({ user: user_id })
            user_dashboard.balance += Number(amount);
            user_dashboard.deposites += Number(amount)
            await user_dashboard.save();
            const transactionData = new Transaction({ PhoneNumber: phone, Amount: amount, Transactioncode: transaction_code });
            await transactionData.save();
            req.flash('success', 'deposit made sucessfully');
        } catch (error) {
            console.log(error);
            req.flash('error', 'Internal server error');
        }
        res.redirect('/exchange')
        return;
    } else {
        req.flash('error', 'Something went wrong with your payment try again');
        res.redirect('/exchange')
    }
}
