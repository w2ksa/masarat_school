import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getStudentLevel, getLevelProgress, getPointsToNextLevel } from "@shared/levels";
import type { Student } from "../../../drizzle/schema";

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange }: StudentDetailsDialogProps) {
  if (!student) return null;

  const level = getStudentLevel(student.score);
  const progress = getLevelProgress(student.score);
  const pointsToNext = getPointsToNextLevel(student.score);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {student.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* المستوى التحفيزي */}
          <div className="text-center space-y-3">
            <div className="text-6xl">{level.icon}</div>
            <div>
              <Badge variant="secondary" className={`text-lg px-4 py-2 ${level.color}`}>
                {level.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{level.description}</p>
          </div>

          {/* النقاط */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">النقاط الحالية</span>
              <span className="text-2xl font-bold text-primary">{student.score}</span>
            </div>
            
            {pointsToNext > 0 && (
              <>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  {pointsToNext} نقطة للوصول إلى المستوى التالي
                </p>
              </>
            )}
          </div>

          {/* التعليق */}
          {student.comment && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground">
                تعليق مدير النظام
              </h4>
              <p className="text-foreground leading-relaxed">{student.comment}</p>
            </div>
          )}

          {!student.comment && (
            <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
              لا يوجد تعليق حالياً
            </div>
          )}

          {/* الترتيب */}
          {student.rank && (
            <div className="flex justify-center items-center gap-2 p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">الترتيب:</span>
              <Badge variant="default" className="text-lg">
                #{student.rank}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
