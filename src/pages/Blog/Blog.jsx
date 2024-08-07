import React, { useEffect, useState } from 'react'
import { FaPencilAlt, FaEye } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from 'react-router-dom';
import axios from 'axios';
import HeaderAdmin from '../../components/HeaderAdmin';
import Modal from '../../components/Modal';
import { formatDate, truncateText } from '../../utils';
import { app } from '../../firebase.js';
import { getStorage, ref, deleteObject } from 'firebase/storage';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/blogs/');
        setBlogs(response.data);
        console.log(blogs)
      } catch (error) {
        console.log('Error al recuperar el blog:', error);
        setError('Error al recuperar el blog. Por favor, inténtelo de nuevo más tarde');
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async () => {
    try {
      if (selectedBlog.imageUrl) {
        const storage = getStorage(app);
        const imageRef = ref(storage, selectedBlog.imageUrl);

        try {
          await deleteObject(imageRef);
        } catch (error) {
          if (error.code === 'storage/object-not-found') {
            console.warn('La imagen no existe en Firebase Storage:', error);
          } else {
            throw error;
          }
        }
      }

      await axios.delete(`http://localhost:3000/blogs/${selectedBlog._id}`);
      setBlogs(blogs.filter(blog => blog._id !== selectedBlog._id));
      setModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setModalOpen(false);
  };

  return (
    <div>
      <HeaderAdmin title={"Administrar"} text={"Blogs"} />
      <div className="mt-4">
        <div className="mt-12 mb-6">
          <div className="bg-white shadow-md shadow-black/5 p-6 rounded-md lg:col-span-2">
            <div className="flex justify-between mb-4 items-start text-gray-50">
              <div className="font-semibold text-base primaryColor">Blog</div>
              <div>
                <Link to={'/admin/blog/create'} className='text-green-600'>Crear</Link>
              </div>
            </div>
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full border-collapse">
                <thead className="bg-primary text-white rounded-md">
                  <tr>
                    <th className="th-table">Titulo</th>
                    <th className="th-table">Contenido</th>
                    <th className="th-table">Fecha</th>
                    <th className="th-table">Imagen</th>
                    <th className="th-table min-w-140-px">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr className="primaryColor" key={blog._id}>
                      <th className="th-title">{blog.title}</th>
                      <td className="th-title max-w-[22rem] whitespace-normal">{truncateText(blog.content, 60)}</td>
                      <th className="th-title">{formatDate(blog.date)}</th>
                      <td className="th-title">
                        {
                        blog.imageUrl && <img src={blog.imageUrl} alt={blog.imageUrl} className="w-20 h-20 object-cover" />}
                      </td>
                      <td className="td-button text-gray-900">
                        <div className="flex items-center space-x-4">
                          <Link to={`/admin/blog/edit/${blog._id}`} className="button-table btn-edit">
                            <FaPencilAlt className="h-4 w-4 mr-2 -ml-0.5" />
                            Editar
                          </Link>
                          <Link to={`/admin/blog/detail/${blog._id}`} className="button-table btn-preview">
                            <FaEye className="h-4 w-4 mr-2 -ml-0.5" />
                            Detalles
                          </Link>
                          <button type="button" onClick={() => openModal(blog)} className="button-table btn-delete">
                            <RiDeleteBinLine className="h-4 w-4 mr-2 -ml-0.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <Modal
          title="Confirmar Eliminación"
          message={`¿Estás seguro que quieres eliminar el blog "${selectedBlog.title}"?`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default Blog;
