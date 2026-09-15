import { CalibrationData } from '../types/case';

export const isCalibrationComplete = (calibration: CalibrationData): boolean => {
  const sourceRequiresCalibration = calibration.pidRequiresCalibration || calibration.arRequiresCalibration;
  const calibrationRequired = sourceRequiresCalibration
    ? !calibration.workshopDisagrees
    : calibration.workshopRequiresCalibration;

  if (sourceRequiresCalibration && calibration.workshopDisagrees) {
    return calibration.comment.trim().length > 0;
  }

  if (!calibrationRequired) return true;

  return calibration.confirmed && calibration.signature.trim().length > 0 && calibration.document !== null;
};
