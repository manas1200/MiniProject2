const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const stripe = Stripe('YOUR_STRIPE_SECRET_KEY');

const Users = mongoose.model('Users', {
    username: String,
    mobile: String,
    email: String,
    password: String,
    adhaarno: String,
    likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
    addToCart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }] 
});

module.exports.likeProducts = (req, res) => {
    let productId = req.body.productId;
    let userId = req.body.userId;

    Users.updateOne({ _id: userId }, { $addToSet: { likedProducts: productId } })
        .then(() => {
            res.send({ message: 'liked success.' })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })

}

module.exports.signup = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const adhaarno = req.body.adhaarno;
    const user = new Users({ username: username, password: password, email, mobile, adhaarno });
    user.save()
        .then(() => {
            res.send({ message: 'saved success.' })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })

}

module.exports.myProfileById = (req, res) => {
    let uid = req.params.userId

    Users.findOne({ _id: uid })
        .then((result) => {
            res.send({
                message: 'success.', user: {
                    email: result.email,
                    mobile: result.mobile,
                    username: result.username,
                    adhaarno: result.adhaarno
                }
            })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })

    return;

}

module.exports.getUserById = (req, res) => {
    const _userId = req.params.uId;
    Users.findOne({ _id: _userId })
        .then((result) => {
            res.send({
                message: 'success.', user: {
                    email: result.email,
                    mobile: result.mobile,
                    username: result.username,
                    adhaarno: result.adhaarno

                }
            })
        })
        .catch(() => {
            res.send({ message: 'server err' })
        })
}


module.exports.login = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Users.findOne({ username: username })
        .then((result) => {
            if (!result) {
                res.send({ message: 'user not found.' })
            } else {
                if (result.password == password) {
                    const token = jwt.sign({
                        data: result
                    }, 'MYKEY', { expiresIn: '1h' });
                    res.send({ message: 'find success.', token: token, userId: result._id })
                }
                if (result.password != password) {
                    res.send({ message: 'password wrong.' })
                }

            }

        })
        .catch(() => {
            res.send({ message: 'server err' })
        })

}

module.exports.likedProducts = (req, res) => {

    Users.findOne({ _id: req.body.userId }).populate('likedProducts')
        .then((result) => {
            res.send({ message: 'success', products: result.likedProducts })
        })
        .catch((err) => {
            res.send({ message: 'server err' })
        })

}
// module.exports.addToCart= (req, res) => {
//     Users.findOne({ _id: req.body.userId }).populate('addToCart')
//         .then((result) => {
//             res.send({ message: 'success', products: result.addToCart })
//         })
//         .catch((err) => {
//             res.send({ message: 'server err' })
//         })
// }

module.exports.addToCart = (req, res) => {
    const { userId, productId } = req.body;

    // Add the product to the user's cart
    Users.updateOne(
        { _id: userId },
        { $addToSet: { addToCart: productId } } // Avoid duplicate entries
    )
        .then(() => {
            // Fetch the updated cart
            Users.findOne({ _id: userId })
                .populate('addToCart')
                .then((result) => {
                    res.send({ message: 'success', products: result.addToCart });
                })
                .catch((err) => {
                    console.error(err);
                    res.send({ message: 'server err' });
                });
        })
        .catch((err) => {
            console.error(err);
            res.send({ message: 'server err' });
        });
};


module.exports.buyproduct = async (req, res) => {
    const { amount, currency } = req.body;

    try {
        // Create a PaymentIntent with the specified amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount in smallest currency unit (e.g., cents for USD)
            currency,
            payment_method_types: ['card']
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};