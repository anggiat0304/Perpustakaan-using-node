module.exports = (sequelize,DataTypes)=>{
    
    const Books  = sequelize.define("Books",{
        title :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        isbn :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        publicationYear :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        author :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        location :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        language :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        type :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        images :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        authencity :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        publisher :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        edition :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        subject :{
            type:DataTypes.STRING,
            allowNull:true,
        },
        description :{
            type:DataTypes.STRING(10000),
            allowNull:true,
        },
    })
    Books.associate = (models)=>{
        Books.hasMany(models.ListOfBooks,{
            onDelete:"cascade",
        });
    }
    return Books;
}