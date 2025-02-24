const forgotPasswordTemplate = ({ name, otp })=>{
    return `
  <div>  
    <p>Dear, ${name}</p>
    <p>You're request a password reset, Please use followind OTP code to
    reset your password.</p>
    <div style="background:purple;font-size:20px;padding:20px;
    text-align:center;font-weght : 800;">
        ${otp}
    </div>
    <p>This otp is valid for 1hour only. Enter this otp in the Mohamed
    website to proceed with resetting your password.</p>
    <br/>
    <br>
    <p>Thanks</p>
    <p>Mohamed</p>
  </div>
`
}

export default forgotPasswordTemplate