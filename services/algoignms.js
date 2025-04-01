const User = require('../models/user.model'); // Import User model

const calculateMatchScore = (userPreferences, otherUserPreferences) => {
  let score = 0;

  userPreferences.forEach(pref => {
    const match = otherUserPreferences.find(p => p.preferenceId.toString() === pref.preferenceId.toString());

    if (match) {
      // Calculate match percentage based on common values
      const commonValues = match.values.filter(value => pref.values.includes(value));
      score += commonValues.length; // Increase score based on common values
    }
  });
  return score;
};


const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
  
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  const getRecommendedMatches = async (userId, radiusKm = 50) => {
    try {
      // Fetch current user details
      const currentUser = await User.findById(userId).populate('preferences.preferenceId');
      if (!currentUser) throw new Error('User not found');
  
      const oppositeSex = currentUser.sex === 'male' ? 'female' : 'male';
  
      // Fetch users of the opposite sex
      let potentialMatches = await User.find({
        _id: { $ne: userId },
        sex: oppositeSex,
        status:"active"
      }).populate('preferences.preferenceId');
  
      // Filter users within the given radius
      potentialMatches = potentialMatches.filter((otherUser) => {
        if (
          !otherUser.locations?.currentLocation?.latitude ||
          !otherUser.locations?.currentLocation?.longitude
        ) {
          return false; // Skip users without a location
        }
  
        const distance = haversineDistance(
          currentUser.locations.currentLocation.latitude,
          currentUser.locations.currentLocation.longitude,
          otherUser.locations.currentLocation.latitude,
          otherUser.locations.currentLocation.longitude
        );
  
        return distance <= radiusKm; // Keep only users within the radius
      });
  
      // Compute match scores
      const matches = potentialMatches.map(otherUser => ({
        user: otherUser,
        matchScore: calculateMatchScore(currentUser.preferences, otherUser.preferences),
      }));
  
      // Sort by match score (descending order)
      matches.sort((a, b) => b.matchScore - a.matchScore);
  
      return matches; // Return sorted list including match scores
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  };
  
module.exports={
  calculateMatchScore,
  haversineDistance,
  getRecommendedMatches
}