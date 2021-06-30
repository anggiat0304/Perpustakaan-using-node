module.exports = (sequelize,DataTypes)=>{
    
    const Returns  = sequelize.define("Returns",{
        returnDate :{
            type:DataTypes.DATE(6),
            allowNull:false,
        },
        
    })

   
    return Returns;
}