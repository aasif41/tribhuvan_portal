import { Request, Response, NextFunction } from 'express';
import { getAuditLogs, generateAuditCSV } from './audit.service';
import { successResponse } from '../../utils/apiResponse';

export async function getAuditLogsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const logs = await getAuditLogs();
    successResponse(res, logs, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function exportAuditCSVController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const csvData = await generateAuditCSV();
    const filename = `Tribhuvan_College_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}
