const generatedOtp = ()=>{
    return Math.floor(Math.random() * 900000)+ 100000 //* 100000 à 999999
}

export default generatedOtp