/** Routes for companies */

const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

/* Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
});

/* Return obj of company: {company: {code, name, description}}
If the company given cannot be found, this should return a 404 status response. */
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const compResult = await db.query(
            "SELECT * FROM companies WHERE code=$1",
            [code]
        );

        const invoiceResult = await db.query(
            "SELECT * FROM invoices WHERE comp_code=$1",
            [code]
        );
        if (compResult.rows.length === 0) {
            throw new ExpressError(
                `Can't find company with a code of ${code}`,
                404
            );
        }
        const company = compResult.rows[0];
        const invoices = invoiceResult.rows;

        company.invoices = invoices.map((inv) => inv.id);

        return res.send({ company: company });
    } catch (e) {
        return next(e);
    }
});

/* input JSON: {code, name, description}
returns obj of new company: {company: {code, name, description}} */
router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
            [code, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

/* Edit existing company.
Should return 404 if company cannot be found.
Input JSON: {name, description}
Returns update company object: {company: {code, name, description}} */
router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company of ${code}`, 404);
        }
        return res.send({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

/* Deletes company.
Should return 404 if company cannot be found.
Returns {status: "deleted"} */
router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            "DELETE FROM companies WHERE code = $1 RETURNING code",
            [code]
        );

        if (results.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404);
        } else {
            return res.send({ status: "deleted" });
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
