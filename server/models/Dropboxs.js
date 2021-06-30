module.exports = (sequelize,DataTypes)=>{
    
    const Dropboxs  = sequelize.define("Dropboxs",{
        name:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        sumBook:{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
    })

    Dropboxs.associate = (models)=>{
        Dropboxs.hasMany(models.Loans,{
            onDelete :"cascade",
        })
        
    }
    return Dropboxs;
}