import { Sequelize } from "sequelize"

const sequelizefun = new Sequelize('adminplem_administracion', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: true // evita que Sequelize pluralice
    }
})

export default sequelizefun 