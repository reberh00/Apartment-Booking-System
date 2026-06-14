const { ZodError } = require("zod");
const { MulterError } = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Greška validacije",
      details:
        err.errors?.map((e) => e.path.join(".") + " " + e.message + "\n") || "",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "Slika je prevelika. Maksimalna veličina je 5 MB." });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({ error: "Neuspješan prijenos datoteke." });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Zapis s tim podacima već postoji" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Zapis nije pronađen" });
  }

  return res.status(err.statusCode || 500).json({
    error: err.message || "Interna greška servera",
  });
};

const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
