const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have name'],
  },
  email: {
    type: String,
    required: [true, 'email must be provided and should be in lower case'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'please provide your email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'password must be provided'],
    minLength: 6,
    select: false, //password should not be selected in queries.
  },
  passwordConfirm: {
    type: String,
    required: true,
    select: false,
    minLength: 6,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  //this points to current query.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const hashPassword = await bcrypt.hash(this.password, 10);
  this.password = hashPassword;
  // const isMatch = await userSchema.method.comparePassword(this.password);
  this.passwordConfirm = undefined;
  // if (isMatch) {
  //   return next();
  // }
  return next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  let changedTimeStamp = '';
  if (this.passwordChangedAt) {
    changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedTimeStamp, JWTTimeStamp);
  }

  return JWTTimeStamp < changedTimeStamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

(async () => {
  await User.ensureIndexes({ email: 1 }, { unique: true });
})();

module.exports = User;
