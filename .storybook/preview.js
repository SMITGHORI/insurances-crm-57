
import '../src/index.css';
import { BrowserRouter } from 'react-router-dom';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    description: {
      component: 'RBAC Components for Insurance CRM'
    }
  }
};

export const decorators = [
  (Story) => (
    <BrowserRouter>
      <div className="p-4">
        <Story />
      </div>
    </BrowserRouter>
  ),
];
