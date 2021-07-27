module.exports = (sequelize,DataTypes)=>{
    
    const Loans  = sequelize.define("Loans",{
        loanDate :{
            type:DataTypes.DATEONLY,
            allowNull:false,
        },
        limitDate :{
            type:DataTypes.DATEONLY,
            allowNull:false,
        },
        status :{
            type:DataTypes.STRING,
            allowNull:false,
        },
    })

    Loans.associate = (models)=>{
        Loans.hasMany(models.Returns,{
            onDelete :"cascade",
        })
        Loans.hasMany(models.Extentions,{
            onDelete :"cascade",
        })
        Loans.belongsTo(models.ListOfBooks ,{
            onDelete :"cascade",
        })
        Loans.belongsTo(models.Members ,{
            onDelete :"cascade",
        })
        
    }
    return Loans;
}