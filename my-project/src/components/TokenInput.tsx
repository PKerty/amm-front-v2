/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import React from "react";
interface TokenProps {
    tokenName: string;
    id: string;
    address: string;
  }
  interface TokenInputProps {
    name: string;
    tokenProps: TokenProps;
  }
  
  const TokenInput: React.FC<TokenInputProps> = ({ tokenProps, name }) => {
    return (
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {tokenProps.tokenName} Price
        </label>
        <div className="relative mt-2 rounded-md shadow-sm mb-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            required
            id="price"
            name={`${name}Value`}
            type="number"
            placeholder="0.00"
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>
            <select
              disabled
              id="currency"
              name={`${name}Token`}
              className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            >
              <option>{tokenProps.id}</option>
            </select>
          </div>
        </div>
      </div>
    );
  };
  
  export default TokenInput;