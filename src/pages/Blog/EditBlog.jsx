import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderAdmin from '../../components/HeaderAdmin';
import { app } from '../../firebase.js';
import { getStorage, ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({ title: '', content: '', imageUrl: '' });
  const [newImage, setNewImage] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/blogs/${id}`)
      .then(response => response.json())
      .then(data => setBlog(data))
      .catch(error => console.error('Error fetching blog:', error));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let updatedBlog = { ...blog };
  
    if (newImage) {
      const storage = getStorage(app);
      const oldImageRef = ref(storage, blog.imageUrl);
  
      if (blog.imageUrl) {
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
  
      const newImageRef = ref(storage, new Date().getTime() + '-' + newImage.name);
      const uploadTask = uploadBytesResumable(newImageRef, newImage);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
          console.error('Error uploading new image:', error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImageUploadProgress(null);
            setImageUploadError(null);
            updatedBlog = { ...updatedBlog, imageUrl: downloadURL };
  
            console.log('Updated:', updatedBlog);
  
            const response = await fetch(`http://localhost:3000/blogs/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedBlog),
            });
  
            if (!response.ok) {
              throw new Error('Error updating blog');
            }
  
            const data = await response.json();
            console.log('Blog updated:', data);
            navigate('/admin/blog');
          } catch (error) {
            console.error('Error updating blog:', error);
          }
        }
      );
    } else {
      try {
        console.log('Updated:', updatedBlog);
  
        const response = await fetch(`http://localhost:3000/blogs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedBlog),
        });
  
        if (!response.ok) {
          throw new Error('Error updating blog');
        }
  
        const data = await response.json();
        console.log('Blog updated:', data);
        navigate('/admin/blog');
      } catch (error) {
        console.error('Error updating blog:', error);
      }
    }
  };
  return (
    <div>
      <HeaderAdmin title={"Editar blog"} text={blog.title} />
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            name="title"
            value={blog.title}
            onChange={handleChange}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenido
          </label>
          <textarea
            name="content"
            value={blog.content}
            onChange={handleChange}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            rows="10"
            required
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            Imagen
          </label>
          {blog.imageUrl && <img src={blog.imageUrl} alt="Current" className="w-20 h-20 object-cover mb-2" />}
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            onChange={handleImageChange}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
          {imageUploadProgress && <p>Cargando imagen: {imageUploadProgress}%</p>}
          {imageUploadError && <p className='text-red-600'>{imageUploadError}</p>}
        </div>
        <div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Editar Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
