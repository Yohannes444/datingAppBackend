const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  categoryId: { 
    type: Number,
    default: null
 },
  name: { 
    type: String,
     required: true
     },
  description: { 
    type: String, 
    default: null 
    },
  kiloCapacity: { 
    type: Number, 
    default: null 
    },
  baseFare: { 
    type: mongoose.Types.Decimal128, 
    required: true 
    },
  perHundredMeters: { 
    type: mongoose.Types.Decimal128, 
    required: true 
    },
  perMinuteDrive: { 
    type: mongoose.Types.Decimal128, 
    required: true 
    },
  perMinuteWait: { 
    type: mongoose.Types.Decimal128, 
    required: true 
    },
  minimumFee: { 
    type: mongoose.Types.Decimal128, 
    required: true 
    },
  searchRadius: { 
    type: Number, 
    required: true 
    },
  distanceFeeMode: { 
    type: String, 
    required: true 
    },
  availableTimeFrom: { 
    type: String, 
    default: null 
    }, // Time stored as string (e.g., "14:00:00")
  availableTimeTo: { 
    type: String, 
    default: null 
    },  // Time stored as string (e.g., "18:00:00")
  maximumDestinationDistance: { 
    type: Number, 
    default: null 
    },
    ailable: { 
    type: Boolean, 
    default: null 
    },
  cancellationTotalFee: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },
  cancellationDriverShare: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },
  providerSharePercent: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },
  providerShareFlat: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },
  roundingFactor: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },
 
  touristMultiplier: { 
    type: mongoose.Types.Decimal128, 
    default: null 
    },

  options: { 
    type: String, 
    default: null }
},
{ timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
