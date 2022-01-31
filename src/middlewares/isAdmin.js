import jwt from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    //     The split() method splits a string into an array of substrings.

    // The split() method returns the new array.

    // The split() method does not change the original string.

    // If (" ") is used as separator, the string is split between words.
    if (token) {
        const { role } = jwt.verify(token, process.env.JWT_SECRET)

        if (role == 1) next()
        else return res.json({
            message: "ACCESS DENIED"
        })
    } else {
        return res.json({
            message: "UNAUTHORISED"
        })
    }
}

export default isAdmin;