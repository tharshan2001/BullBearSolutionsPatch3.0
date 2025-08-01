import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { deductTransactionFeeAndUpdateWallet } from "../utils/TransactionFee.js";
import { createNotification } from "../controllers/notificationController.js";

// Create deposit
export const createDeposit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;
    const currency = (req.body.currency || "usdt").toLowerCase();

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
    if (currency !== "usdt") {
      return res
        .status(400)
        .json({ message: "Deposits can only be made in USDT" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Deposit slip file is required" });
    }

    const files = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      type: file.mimetype,
    }));

    const depositTransaction = new Transaction({
      user: userId,
      type: "deposit",
      amount,
      currency,
      status: "pending",
      files,
      adminApproved: false,
    });

    await depositTransaction.save();

    // Notify user
    await createNotification(
      userId,
      `Your deposit request of ${amount} USDT has been submitted and is pending admin approval.`,
      "pending"
    );

    res
      .status(201)
      .json({ message: "Deposit request created", depositTransaction });
  } catch (error) {
    console.error("Error creating deposit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// withdrawal.js
export const createWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount: rawAmount, currency, network, networkAddress } = req.body;

    // Validate and parse amount
    const amount = Number(rawAmount);
    if (isNaN(amount) || amount < 21) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal amount is 21 USDT" });
    }

    // Validate currency
    if (!currency || currency.toLowerCase() !== "usdt") {
      return res
        .status(400)
        .json({ message: "Withdrawals are only allowed in USDT" });
    }

    // Validate network
    if (!network || !["TRC20", "BEP20"].includes(network)) {
      return res
        .status(400)
        .json({ message: "Please specify a valid network: TRC20 or BEP20" });
    }

    // Validate network address
    if (
      !networkAddress ||
      typeof networkAddress !== "string" ||
      !networkAddress.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Please provide a valid network address" });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure wallet structure
    if (!user.wallet || typeof user.wallet.usdt !== "number") {
      return res
        .status(400)
        .json({ message: "User wallet not properly set up" });
    }

    // Calculate fee and total with 2 decimal precision
    const roundedAmount = parseFloat(amount.toFixed(2));
    const fee = parseFloat((roundedAmount * 0.05).toFixed(2));
    const totalRequired = parseFloat((roundedAmount + fee).toFixed(2));
    const userBalance = parseFloat((user.wallet.usdt || 0).toFixed(2));

    // Check balance
    if (userBalance < totalRequired) {
      return res
        .status(400)
        .json({
          message:
            "Insufficient balance to cover withdrawal amount plus 5% fee",
        });
    }

    // Create withdrawal transaction
    const withdrawalTransaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount: roundedAmount,
      currency: "usdt",
      network,
      networkAddress: networkAddress.trim(),
      fee,
      status: "pending",
      adminApproved: false,
    });

    await withdrawalTransaction.save();

    // Notify user
    await createNotification(
      userId,
      `Your withdrawal request of ${roundedAmount} USDT (plus 5% fee) has been submitted.`,
      "pending"
    );

    res.status(201).json({
      message: "Withdrawal request created and is pending admin approval",
      withdrawalTransaction,
    });
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Transfer amount
export const transferAmount = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!["usdt", "cw"].includes(currency?.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Currency must be either usdt or cw" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    if (currency.toLowerCase() === "usdt") {
      if ((sender.wallet.usdt || 0) < amount) {
        return res.status(400).json({ message: "Insufficient USDT balance" });
      }
      sender.wallet.usdt -= amount;
    } else {
      if ((sender.wallet.cw || 0) < amount) {
        return res.status(400).json({ message: "Insufficient CW balance" });
      }
      sender.wallet.cw -= amount;
    }

    // Receiver always receives in CW
    receiver.wallet.cw = (receiver.wallet.cw || 0) + amount;

    sender.wallet.lastUpdated = new Date();
    receiver.wallet.lastUpdated = new Date();

    await sender.save();
    await receiver.save();

    const transaction = new Transaction({
      user: senderId,
      type: "transfer",
      amount,
      currency: currency.toLowerCase(),
      status: "completed",
      description: `Transfer to user ${receiverId}`,
      referenceId: receiverId,
    });
    await transaction.save();

    // Notify sender
    await createNotification(
      senderId,
      `You have successfully transferred ${amount} ${currency.toUpperCase()} to user ${receiverId}.`,
      "success"
    );
    // Notify receiver
    await createNotification(
      receiverId,
      `You have received ${amount} CW from user ${senderId}.`,
      "success"
    );

    res
      .status(200)
      .json({ message: "Transfer completed successfully", transaction });
  } catch (error) {
    console.error("Error transferring amount:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Swap USDT to CW
export const swapUsdtToCw = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if ((user.wallet.usdt || 0) < amount) {
      return res.status(400).json({ message: "Insufficient USDT balance" });
    }

    user.wallet.usdt -= amount;
    user.wallet.cw = (user.wallet.cw || 0) + amount;
    user.wallet.lastUpdated = new Date();

    await user.save();

    const transaction = new Transaction({
      user: userId,
      type: "swap",
      amount,
      currency: "usdt",
      status: "completed",
      description: `Swapped ${amount} USDT to CW`,
    });
    await transaction.save();

    // Notify user
    await createNotification(
      userId,
      `You have successfully swapped ${amount} USDT to CW.`,
      "success"
    );

    res
      .status(200)
      .json({ message: "Swap completed successfully", transaction });
  } catch (error) {
    console.error("Error during swap:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transaction by ID (user)
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id).populate(
      "user",
      "fullName email"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check permission: if not admin, user can only access their own transactions
    if (
      !req.user.isAdmin &&
      transaction.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to view this transaction",
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all transactions (admin), optionally by userId
export const getAllTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = {};

    if (userId) {
      filter.user = userId;
    }

    const transactions = await Transaction.find(filter)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transactions of logged-in user
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve deposit (admin)
export const approveDeposit = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const adminId = req.user._id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (transaction.type !== "deposit") {
      return res.status(400).json({ message: "Transaction is not a deposit" });
    }
    if (transaction.status === "completed") {
      return res.status(400).json({ message: "Deposit already approved" });
    }

    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wallet.usdt = (user.wallet.usdt || 0) + transaction.amount;
    user.wallet.lastUpdated = new Date();

    transaction.status = "completed";
    transaction.adminApproved = true;
    transaction.admin = adminId;

    await user.save();
    await transaction.save();

    // Notify user
    await createNotification(
      transaction.user,
      `Your deposit of ${transaction.amount} USDT has been approved and added to your wallet.`,
      "success"
    );

    res.status(200).json({ message: "Deposit approved", transaction });
  } catch (error) {
    console.error("Error approving deposit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve withdrawal (admin)
// export const approveWithdrawal = async (req, res) => {
//   try {
//     const { transactionId } = req.params;
//     const adminId = req.user._id;

//     const transaction = await Transaction.findById(transactionId);
//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }
//     if (transaction.type !== "withdrawal") {
//       return res.status(400).json({ message: "Transaction is not a withdrawal" });
//     }
//     if (transaction.status === "completed") {
//       return res.status(400).json({ message: "Withdrawal already approved" });
//     }

//     const user = await User.findById(transaction.user);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if ((user.wallet.usdt || 0) < transaction.amount) {
//       return res.status(400).json({ message: "Insufficient USDT balance" });
//     }

//     user.wallet.usdt -= transaction.amount;
//     user.wallet.lastUpdated = new Date();

//     transaction.status = "completed";
//     transaction.adminApproved = true;
//     transaction.admin = adminId;

//     await user.save();
//     await transaction.save();

//     // Notify user
//     await createNotification(transaction.user, `Your withdrawal of ${transaction.amount} USDT has been approved and processed.`, 'success');

//     res.status(200).json({ message: "Withdrawal approved", transaction });
//   } catch (error) {
//     console.error("Error approving withdrawal:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const adminId = req.user._id;

    // Fetch transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Validate type
    if (transaction.type !== "withdrawal") {
      return res
        .status(400)
        .json({ message: "Transaction is not a withdrawal." });
    }

    // Already completed
    if (transaction.status === "completed") {
      return res.status(400).json({ message: "Withdrawal already approved." });
    }

    // Fetch user
    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userBalance = user.wallet?.usdt || 0;

    // Minimum withdrawal amount check
    if (transaction.amount < 21) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal amount is 21 USDT." });
    }

    // Fee calculation (5%)
    const fee = transaction.amount * 0.05;
    const totalRequired = transaction.amount + fee;

    // Check for sufficient balance
    if (userBalance < totalRequired) {
      console.warn(
        `Insufficient balance: User (${user._id}) has ${userBalance} USDT, needs ${totalRequired} USDT.`
      );
      return res.status(400).json({
        message: "Insufficient balance to cover withdrawal amount and 5% fee.",
        required: totalRequired,
        available: userBalance,
      });
    }

    // Deduct amount using helper
    const { netAmount, updatedBalance } =
      await deductTransactionFeeAndUpdateWallet(user._id, transaction.amount);

    // Update transaction
    transaction.status = "completed";
    transaction.adminApproved = true;
    transaction.adminApprovedAt = new Date();
    transaction.adminApprovedBy = adminId;
    transaction.meta = {
      ...transaction.meta,
      fee,
      netAmountAfterFee: netAmount,
    };

    await transaction.save();

    return res.status(200).json({
      message: "Withdrawal approved, balance deducted including 5% fee.",
      transaction,
      userBalance: updatedBalance,
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// Reject transaction (admin)
// Reject transaction (admin)
export const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const adminId = req.user._id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (transaction.status === "rejected") {
      return res.status(400).json({ message: "Transaction already rejected" });
    }
    if (transaction.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot reject a completed transaction" });
    }

    transaction.status = "rejected";
    transaction.adminApproved = false;
    transaction.admin = adminId;

    await transaction.save();

    // Notify user
    await createNotification(
      transaction.user,
      `Your ${transaction.type} request has been rejected by admin.`,
      "error"
    );

    res.status(200).json({ message: "Transaction rejected", transaction });
  } catch (error) {
    console.error("Error rejecting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};
