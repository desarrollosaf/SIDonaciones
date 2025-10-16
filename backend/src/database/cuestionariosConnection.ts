import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_donaciones', 'usr_donaciones', 'Xjcr79t48LJLQmxsHIjO', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }
})
export default sequelizeCuestionarios 
