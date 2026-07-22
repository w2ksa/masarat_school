export default function Footer() {
  return (
    <footer className="mt-8 sm:mt-12 border-t border-border bg-card/50 backdrop-blur">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 text-muted-foreground">
          {/* Contact Information */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4">في حال وجود مشكلة تواصل مع:</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
              {/* ريان - أولاً */}
              <a 
                href="tel:0507008853" 
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg px-4 py-3 transition-all w-full sm:w-auto"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="text-right flex-1 sm:flex-none">
                  <p className="font-semibold text-blue-400 text-sm">موجه طلابي صفوف أولية</p>
                  <p className="text-foreground text-sm">ريان مسفر القحطاني</p>
                  <p className="text-muted-foreground text-base font-mono" dir="ltr">050 700 8853</p>
                </div>
              </a>

              {/* فارس - ثانياً */}
              <a 
                href="tel:0552578870" 
                className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg px-4 py-3 transition-all w-full sm:w-auto"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="text-right flex-1 sm:flex-none">
                  <p className="font-semibold text-green-400 text-sm">موجه طلابي صفوف عليا</p>
                  <p className="text-foreground text-sm">فارس آل الشيخ</p>
                  <p className="text-muted-foreground text-base font-mono" dir="ltr">055 257 8870</p>
                </div>
              </a>

              {/* سعود - ثالثاً */}
              <a 
                href="tel:0558152510" 
                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg px-4 py-3 transition-all w-full sm:w-auto"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="text-right flex-1 sm:flex-none">
                  <p className="font-semibold text-purple-400 text-sm">دعم فني</p>
                  <p className="text-foreground text-sm">سعود آل زايد</p>
                  <p className="text-muted-foreground text-base font-mono" dir="ltr">055 815 2510</p>
                </div>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center border-t border-border pt-4">
            <p className="text-base sm:text-lg font-bold text-foreground">مسارات - ابتدائية أبها الأهلية</p>
            <p className="text-xs sm:text-sm text-muted-foreground">جيلُ الهِمّة والقمّة</p>
            <p className="text-xs text-muted-foreground/60 mt-2">© 2026 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
