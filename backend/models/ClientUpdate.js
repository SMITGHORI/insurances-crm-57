
// This file contains the additional fields to be added to the existing Client model

// Add these fields to the main client schema in Client.js:

const additionalClientFields = {
  // Communication preferences
  communicationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      birthday: {
        type: Boolean,
        default: true
      },
      anniversary: {
        type: Boolean,
        default: true
      },
      offers: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: false
      }
    },
    whatsapp: {
      enabled: {
        type: Boolean,
        default: false
      },
      number: {
        type: String,
        match: /^\+\d{1,3}\d{10}$/
      },
      birthday: {
        type: Boolean,
        default: false
      },
      anniversary: {
        type: Boolean,
        default: false
      },
      offers: {
        type: Boolean,
        default: false
      },
      reminders: {
        type: Boolean,
        default: false
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      birthday: {
        type: Boolean,
        default: false
      },
      anniversary: {
        type: Boolean,
        default: false
      },
      offers: {
        type: Boolean,
        default: false
      },
      reminders: {
        type: Boolean,
        default: false
      }
    }
  },

  // Important dates
  importantDates: {
    // For individual clients - added to individualData
    marriageAnniversary: {
      type: Date
    },
    
    // For corporate clients - added to corporateData
    incorporationDate: {
      type: Date
    },
    
    // For group clients - added to groupData
    groupAnniversary: {
      type: Date
    }
  },

  // Loyalty program
  loyaltyProgram: {
    enrolled: {
      type: Boolean,
      default: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    totalReferrals: {
      type: Number,
      default: 0
    }
  },

  // Communication history summary
  communicationStats: {
    lastEmailSent: Date,
    lastWhatsAppSent: Date,
    lastSMSSent: Date,
    totalCommunications: {
      type: Number,
      default: 0
    },
    emailOpens: {
      type: Number,
      default: 0
    },
    whatsappDelivered: {
      type: Number,
      default: 0
    }
  }
};

// Additional virtual fields for Client model:
// clientSchema.virtual('upcomingBirthday').get(function() {
//   if (this.clientType === 'individual' && this.individualData?.dob) {
//     const today = new Date();
//     const thisYear = today.getFullYear();
//     const birthday = new Date(this.individualData.dob);
//     birthday.setFullYear(thisYear);
//     
//     if (birthday < today) {
//       birthday.setFullYear(thisYear + 1);
//     }
//     
//     return birthday;
//   }
//   return null;
// });

// clientSchema.virtual('upcomingAnniversary').get(function() {
//   let anniversaryDate = null;
//   
//   if (this.clientType === 'individual' && this.importantDates?.marriageAnniversary) {
//     anniversaryDate = this.importantDates.marriageAnniversary;
//   } else if (this.clientType === 'corporate' && this.importantDates?.incorporationDate) {
//     anniversaryDate = this.importantDates.incorporationDate;
//   } else if (this.clientType === 'group' && this.importantDates?.groupAnniversary) {
//     anniversaryDate = this.importantDates.groupAnniversary;
//   }
//   
//   if (anniversaryDate) {
//     const today = new Date();
//     const thisYear = today.getFullYear();
//     const anniversary = new Date(anniversaryDate);
//     anniversary.setFullYear(thisYear);
//     
//     if (anniversary < today) {
//       anniversary.setFullYear(thisYear + 1);
//     }
//     
//     return anniversary;
//   }
//   return null;
// });

module.exports = { additionalClientFields };
