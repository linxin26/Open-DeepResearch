import { useState } from 'react';

const ActionPanel = ({ config }) => {
  const [formData, setFormData] = useState({ topic: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="action-panel p-8 flex flex-col justify-center">
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="topic" className="block font-bold mb-2">
            {config.label}
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" className="w-full p-4 bg-primary text-white rounded-md font-bold">
          {config.buttonText}
        </button>
      </form>
      <div className="footer-nav mt-6 text-center">
        <a href="/" className="text-gray-600 hover:text-primary mr-4">
          返回智能体中心
        </a>
        <span className="text-gray-400">•</span>
        <a href="/static/history.html" className="text-gray-600 hover:text-primary ml-4">
          查看生成历史
        </a>
      </div>
    </div>
  );
};

export default ActionPanel;