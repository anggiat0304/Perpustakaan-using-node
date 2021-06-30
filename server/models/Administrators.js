module.exports = (sequelize,DataTypes)=>{
    const Administrators  = sequelize.define("Administrators",{
        name :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        tag :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        nik :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        status :{
            type:DataTypes.STRING,
            allowNull:false,
            enum :['Pending' , 'Active'],
            default: 'Pending'
        },
        confirmationCode:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:true,
        },
        email :{
            type:DataTypes.STRING,
            allowNull:false,
        }
    })
    return Administrators;
}