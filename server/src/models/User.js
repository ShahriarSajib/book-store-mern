/**
 * models/User.js
 * Responsibility:
 *   - Schema for registered users (customer + admin + managers).
 *   - Holds auth fields, profile, role, addresses, view/search history.
 *   - Password hashing hooks; toJSON strips sensitive fields.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const env = require("../config/env");

const ROLES = {
  CUSTOMER: "customer",
  BOOK_MANAGER: "book_manager",
  ORDER_MANAGER: "order_manager",
  ADMIN: "admin",
};

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    recipient: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: "Bangladesh", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: true, minlength: 8, select: false },

    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    isActive: { type: Boolean, default: true },

    avatar: { type: String },
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    addresses: [addressSchema],

    browseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    searchHistory: [{ type: String, maxlength: 200 }],
    favoriteGenres: [{ type: String }],

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
  return token;
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    phone: this.phone,
    bio: this.bio,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    addresses: this.addresses || [],
    favoriteGenres: this.favoriteGenres || [],
    createdAt: this.createdAt,
  };
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

User.ROLES = ROLES;

module.exports = User;
