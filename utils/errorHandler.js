const handleErrors = (err, res) => {
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
};

module.exports = { handleErrors };
