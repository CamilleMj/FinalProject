const bcrypt = require("bcryptjs")

const myFunction = async () => {
    const password = ""
    const hashedPassword = await bcrypt.hash(password, 8)
    console.log(password);
    console.log(hashedPassword);
}

myFunction()