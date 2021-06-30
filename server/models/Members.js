module.exports = (sequelize,DataTypes)=>{
    
    const Members  = sequelize.define("Members",{
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
        email :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        status :{
            type:DataTypes.STRING,
            allowNull:false,
            enum :['Pending' , 'Active','Block'],
            default: 'Pending'
        },
        posisition :{
            type:DataTypes.STRING,
            allowNull:false,
        },
        loanAmount :{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
        lateAmount :{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
    })
    Members.associate = (models)=>{
        Members.hasMany(models.Loans,{
            onDelete :"cascade",
        })
        Members.hasMany(models.Returns,{
            onDelete :"cascade",
        })
        Members.hasMany(models.Extentions,{
            onDelete :"cascade",
        })
    }
    return Members;
}