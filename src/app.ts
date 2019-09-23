import * as mysql from 'mysql';
import * as express from 'express';
import { Router, Request, Response } from 'express';
import { PoolConnection, Pool, Query, QueryFunction } from 'mysql';
import * as bodyParser from 'body-parser';

interface pQueryFunction
{  (sql: string, params: any[]): Promise<any>;  
}

interface pPoolConnection extends PoolConnection
{   pQuery: pQueryFunction;
}

interface pRequestDBFunction
{  (req: Request, res: Response, query: pQueryFunction):void
}


const C = {
    host: 'localhost',
    user:'boss',
    password: ',jcc',
    database: 'pftools'
    // database: 'dbs161750'
}


const pool: Pool = mysql.createPool({ 
    waitForConnections: true,
    connectionLimit: 99,
    host     : C.host,
    user     : C.user,
    password : C.password,
    database : C.database
})
  
 // Ping database to check for common exception errors.
function aGetConnection()
{  return new Promise<pPoolConnection>( (resolve, reject)=>
   {        pool.getConnection((err, connection ) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
                reject(err)
            }
            if (connection) 
            {   (connection as pPoolConnection).pQuery = 
                    (sql: string, param: any[]) =>new Promise<any>((rv,rj)=>{
                        connection.query(sql, param, function(err, d){                        
                            if (err) rj(err); else rv(d);
                    })
                });                              
                resolve((connection as pPoolConnection))
            }
            // connection.release()            
        })
    
    }) 
}

/**
 * Send JSON error to the client
 * @param e - Error info structure
 * @param res - Response
 */
function sendError(e:any, res: Response)
{  res.status(500).type('application/json').json(
    {error: true, info:e}
   );
}

/**
 * Main Get Query
 * @param req Request
 * @param res Response
 * @param query MySQL query Promise function
 */
async function get(req: Request, res: Response, query:pQueryFunction)
{  try
   {  const d = await query('select * from sales_companies where cid=?',[280366]);       
      const u = await query('select * from mc_users where id=?',[1]);       
      const r3 = await query("set @data  = 'Fuck'", []);
      const r4 = await query("select @data", []);       
      res.status(200).type('application/json').json({ c:d, u:u, check_var:r4 });
    } catch (e)
    { sendError(e, res);
    }
}

async function dbQuery(req: Request, res: Response, foo: pRequestDBFunction)
{   let dbc: pPoolConnection | undefined;
    try
    {
       // const dbc = await asyncGetPool()
       // const aQuery = util.promisify(dbc.query);       
       dbc = await aGetConnection(); 
       foo(req, res, dbc.pQuery);       
    } 
    catch (e)
    {  console.log('ERROR:', e); 
       res.status(400).type('application/json').json({error: e});
    }
    finally {
        if (dbc!==undefined) dbc.release();
        console.log('main() done');
    }
    return true;
}


const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('public'))

// cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    next();
});

app.get('/', (req: Request, res: Response)=>dbQuery(req, res, get) );

app.listen(3000, function () {
   console.log('Example app listening on port 3000!');
});
