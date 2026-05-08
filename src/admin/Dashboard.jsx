import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
      <h3 className="text-xl md:text-2xl font-serif mb-4">Bienvenido al Panel de Administración</h3>
      <p className="text-gray-600 text-sm md:text-base">
        Desde aquí puedes gestionar el contenido de tu floristería. Utiliza el menú lateral para acceder a la gestión de categorías y productos.
      </p>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="p-6 bg-florencia-cream rounded-lg border border-gray-200">
          <h4 className="font-medium text-lg mb-2">Categorías</h4>
          <p className="text-sm text-gray-500 mb-4">Configura las imágenes principales y el contenido de las secciones.</p>
          <Link to="/admin/categories" className="text-florencia-gold hover:underline text-sm font-medium">Ir a Categorías &rarr;</Link>
        </div>
        <div className="p-6 bg-florencia-cream rounded-lg border border-gray-200">
          <h4 className="font-medium text-lg mb-2">Productos</h4>
          <p className="text-sm text-gray-500 mb-4">Añade nuevos arreglos florales a tu catálogo con foto, descripción y precio.</p>
          <Link to="/admin/products" className="text-florencia-gold hover:underline text-sm font-medium">Ir a Productos &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
