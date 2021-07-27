module.exports = (sequelize,DataTypes)=>{
    
    const Returns  = sequelize.define("Returns",{
        returnDate :{
            type:DataTypes.DATEONLY,
            allowNull:false,
        },
        
    })
    Returns.associate = (models)=>{
        Returns.belongsTo(models.Loans,{
            onDelete :"cascade",
        })
        Returns.belongsTo(models.ListOfBooks ,{
            onDelete :"cascade",
        })
        Returns.belongsTo(models.Members ,{
            onDelete :"cascade",
        })
        
    }
   
    return Returns;
}