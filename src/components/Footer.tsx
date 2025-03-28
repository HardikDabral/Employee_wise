import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">EmployeeWise</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Simplifying employee management
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <p className="text-muted-foreground">
              © 2024 EmployeeWise
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;