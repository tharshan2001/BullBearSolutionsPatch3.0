export const checkPremiumStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { premium } = req.user;

    if (premium?.active && premium?.activatedDate) {
      // Calculate expiry date (1 year after activatedDate)
      const expiryDate = new Date(premium.activatedDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // If expired, deactivate premium and save user
      if (new Date() >= expiryDate) {
        req.user.premium.active = false;
        await req.user.save();
        return res.status(403).json({ message: "Premium membership expired" });
      }
    }

    // If premium not active or expired, block access
    if (!req.user.premium?.active) {
      return res.status(403).json({ message: "Upgrade to Premium membership" });
    }

    next();
  } catch (err) {
    console.error("Error checking premium status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
