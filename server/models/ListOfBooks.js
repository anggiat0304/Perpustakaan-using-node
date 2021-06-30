module.exports = (sequelize,DataTypes)=>{
    
    const ListOfBooks  = sequelize.define("ListOfBooks",{
        status :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        extention :{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
        tag :{
            type:DataTypes.STRING,
            allowNull:false,
        },
    })

    ListOfBooks.associate = (models)=>{
        ListOfBooks.hasMany(models.Loans,{
            onDelete :"cascade",
        })
        ListOfBooks.hasMany(models.Returns,{
            onDelete :"cascade",
        })
        ListOfBooks.hasMany(models.Extentions,{
            onDelete :"cascade",
        })
        ListOfBooks.belongsTo(models.Books,{
            onDelete :"cascade",
        })
    }
    return ListOfBooks;
}