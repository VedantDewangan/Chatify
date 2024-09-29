const jwt = require('jsonwebtoken');
const { User } = require('../DataBase/Model/UserModel');
const dotenv = require('dotenv');

dotenv.config();

const isLogin = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
         
        if (!token) {
            return res.status(401).send({ success: false, msg: 'User unauthorized' });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).send({ success: false, msg: 'Invalid token' });
        }

        const user = await User.findById(
            decode.userId
        ).select('-password');
        if (!user) {
            return res.status(404).send({
                msg: 'User not found',
                success: false
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

module.exports = {
    isLogin
};
