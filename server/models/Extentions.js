module.exports = (sequelize,DataTypes)=>{
    
    const Extentions  = sequelize.define("Extentions",{
        renewalDate:{
            type:DataTypes.DATE,
            allowNull:false,
        },
        returnLimit :{
            type:DataTypes.DATE,
            allowNull:false,
        },
    })

  
    return Extentions;
}