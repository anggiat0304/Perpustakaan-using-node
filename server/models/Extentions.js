module.exports = (sequelize,DataTypes)=>{
    
    const Extentions  = sequelize.define("Extentions",{
        renewalDate:{
            type:DataTypes.DATEONLY,
            allowNull:false,
        },
        returnLimit :{
            type:DataTypes.DATEONLY,
            allowNull:false,
        },
    })
    Extentions.associate = (models)=>{
        Extentions.belongsTo(models.Loans,{
            onDelete :"cascade",
        })
        Extentions.belongsTo(models.ListOfBooks ,{
            onDelete :"cascade",
        })
        Extentions.belongsTo(models.Members ,{
            onDelete :"cascade",
        })
        
    }
  
    return Extentions;
}