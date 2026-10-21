import React, { useState } from 'react';
import { sound } from '../services/sound';

interface CalculatorViewProps {
  onSendToSolver: (expression: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onSendToSolver }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (val: string) => {
    sound.playSoftTap();
    setError(false);
    if (val === 'C') {
      setExpression('');
      setResult('');
      return;
    }
    if (val === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      evaluateExpression();
      return;
    }
    setExpression((prev) => prev + val);
  };

  const evaluateExpression = () => {
    try {
      if (!expression.trim()) return;

      // Safe evaluation of mathematical expressions
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // Restrict characters to safe math
      if (!/^[0-9+\-*/().\sMathPIElogsincoartn*]+$/.test(sanitized)) {
        throw new Error('Invalid math expression');
      }

      // eslint-disable-next-line no-eval
      const evaluated = Function(`"use strict"; return (${sanitized})`)();
      if (typeof evaluated === 'number' && !isNaN(evaluated)) {
        const rounded = Number.isInteger(evaluated)
          ? evaluated.toString()
          : parseFloat(evaluated.toFixed(8)).toString();
        setResult(rounded);
        sound.playGentleChime();
      } else {
        setError(true);
        setResult('Error');
      }
    } catch {
      setError(true);
      setResult('Error');
    }
  };

  const handleSendToSolver = () => {
    const text = result && result !== 'Error' ? `${expression} = ${result}` : expression;
    if (text) {
      sound.playSoftTap();
      onSendToSolver(`Solve and verify this calculation: ${text}`);
    }
  };

  const keypad = [
    ['sin(', 'cos(', 'tan(', 'C', 'DEL'],
    ['log(', 'ln(', 'sqrt(', '(', ')'],
    ['π', 'e', '^', '÷', '×'],
    ['7', '8', '9', '-', '+'],
    ['4', '5', '6', '1', '2'],
    ['3', '0', '.', '=']
  ];

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="mb-4">
        <span className="font-label-caps text-label-caps text-[#534439] tracking-wider uppercase font-semibold">
          Scientific Calculation
        </span>
        <h2 className="font-headline-md text-[22px] text-[#2B1D14] font-medium leading-tight">
          Scientific Calculator
        </h2>
      </div>

      {/* Calculator Display Screen */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] mb-4 text-right">
        <div className="text-[13px] text-[#534439] h-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {expression || '0'}
        </div>
        <div
          className={`font-display text-[32px] tracking-tight font-semibold h-11 overflow-x-auto whitespace-nowrap scrollbar-none ${
            error ? 'text-[#BA1A1A]' : 'text-[#2B1D14]'
          }`}
        >
          {result || (expression ? '' : '0')}
        </div>
      </div>

      {/* Send to Solver bridge button */}
      {(expression || result) && (
        <button
          type="button"
          onClick={handleSendToSolver}
          className="mb-4 py-2 px-3 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] hover:border-[#C27A3E] text-[#8A4C13] font-label-md text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>Send Formula to Step-by-Step Solver &rarr;</span>
        </button>
      )}

      {/* Keypad Grid styled to design tokens */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1: Scientific functions */}
        <button
          type="button"
          onClick={() => handlePress('sin(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          sin
        </button>
        <button
          type="button"
          onClick={() => handlePress('cos(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          cos
        </button>
        <button
          type="button"
          onClick={() => handlePress('tan(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          tan
        </button>
        <button
          type="button"
          onClick={() => handlePress('C')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[13px] text-[#BA1A1A] hover:bg-[#FAF7F2] cursor-pointer font-bold"
        >
          C
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handlePress('log(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          log
        </button>
        <button
          type="button"
          onClick={() => handlePress('ln(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          ln
        </button>
        <button
          type="button"
          onClick={() => handlePress('sqrt(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          √
        </button>
        <button
          type="button"
          onClick={() => handlePress('DEL')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[13px] text-[#534439] hover:border-[#C27A3E] cursor-pointer"
        >
          ⌫
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handlePress('(')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          (
        </button>
        <button
          type="button"
          onClick={() => handlePress(')')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          )
        </button>
        <button
          type="button"
          onClick={() => handlePress('^')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          xʸ
        </button>
        <button
          type="button"
          onClick={() => handlePress('÷')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[15px] text-[#8A4C13] font-bold hover:border-[#C27A3E] cursor-pointer"
        >
          ÷
        </button>

        {/* Row 4: 7, 8, 9, * */}
        <button
          type="button"
          onClick={() => handlePress('7')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handlePress('8')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handlePress('9')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handlePress('×')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[15px] text-[#8A4C13] font-bold hover:border-[#C27A3E] cursor-pointer"
        >
          ×
        </button>

        {/* Row 5: 4, 5, 6, - */}
        <button
          type="button"
          onClick={() => handlePress('4')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handlePress('5')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handlePress('6')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handlePress('-')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[15px] text-[#8A4C13] font-bold hover:border-[#C27A3E] cursor-pointer"
        >
          -
        </button>

        {/* Row 6: 1, 2, 3, + */}
        <button
          type="button"
          onClick={() => handlePress('1')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handlePress('2')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handlePress('3')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handlePress('+')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[15px] text-[#8A4C13] font-bold hover:border-[#C27A3E] cursor-pointer"
        >
          +
        </button>

        {/* Row 7: 0, ., π, = */}
        <button
          type="button"
          onClick={() => handlePress('0')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handlePress('.')}
          className="h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] font-label-md text-[15px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handlePress('π')}
          className="h-12 rounded-xl bg-[#EFE6DA] border border-[#E8E0D5] font-label-md text-[13px] text-[#2B1D14] hover:border-[#C27A3E] cursor-pointer"
        >
          π
        </button>
        <button
          type="button"
          onClick={() => handlePress('=')}
          className="h-12 rounded-xl bg-[#8A4C13] hover:bg-[#C27A3E] text-[#FAF7F2] font-label-md text-[16px] font-bold flex items-center justify-center cursor-pointer transition-colors"
        >
          =
        </button>
      </div>
    </div>
  );
};
