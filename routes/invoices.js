const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

/* Return invoices: {invoices: [{id, comp_code}, ...]} */
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query("SELECT * FROM invoices");
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});

/* If invoice cannot be found, returns 404.
Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}} */
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            "SELECT * FROM invoices JOIN companies ON companies.code = invoices.comp_code WHERE id = $1",
            [id]
        );
        if (results.rows.length == 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }
        const data = results.rows[0];
        const invoice = {
            invoice: {
                id: data.id,
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
            },
            company: {
                code: data.code,
                name: data.name,
                description: data.description,
            },
        };
        return res.json({ invoice: invoice });
    } catch (e) {
        return next(e);
    }
});

/*Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(
            "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [comp_code, amt]
        );
        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

/* Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt, paid}
If paying unpaid invoice: sets paid_date to today
If un-paying: sets paid_date to null
Else: keep current paid_date
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        const currentInvoice = await db.query(
            "SELECT * FROM invoices WHERE id=$1",
            [id]
        );
        let paid_date;
        if (currentInvoice.rows.length === 0) {
            throw new ExpressError(`Can't update invoice: ${id}`, 404);
        }

        if (currentInvoice.rows[0].paid === false && paid === true) {
            paid_date = new Date();
        } else if (currentInvoice.rows[0].paid === true && paid === false) {
            paid_date = null;
        } else {
            paid_date = currentInvoice.rows[0].paid_date;
        }

        const results = await db.query(
            "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [amt, paid, paid_date, id]
        );

        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

/* Deletes an invoice.
If invoice cannot be found, returns a 404.
Returns: {status: "deleted"}*/
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const results = await db.query(
            "DELETE FROM invoices WHERE id = $1 RETURNING id",
            [id]
        );

        if (results.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        } else {
            return res.send({ status: "deleted" });
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
